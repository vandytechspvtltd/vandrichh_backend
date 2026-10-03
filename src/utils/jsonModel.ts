import { generateId, readData, writeData } from "./jsonDatabase.js";

type JsonRecord = Record<string, any>;
type Filter = Record<string, any>;

const models = new Map<string, any>();

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const valueAt = (record: JsonRecord, path: string): any =>
  path.split(".").reduce((value, key) => value?.[key], record);

const comparable = (value: any) => {
  if (value instanceof Date) return value.getTime();
  if (value && typeof value === "object" && "_id" in value) return String(value._id);
  return value;
};

const matchesValue = (actual: any, expected: any): boolean => {
  if (expected instanceof RegExp) {
    return (Array.isArray(actual) ? actual : [actual]).some((value) => expected.test(String(value ?? "")));
  }
  if (expected && typeof expected === "object" && !Array.isArray(expected) && !(expected instanceof Date)) {
    return Object.entries(expected as Record<string, any>).every(([operator, operand]) => {
      const values = Array.isArray(actual) ? actual : [actual];
      switch (operator) {
        case "$in": return operand.some((item: any) => values.some((value) => comparable(value) === comparable(item)));
        case "$nin": return operand.every((item: any) => values.every((value) => comparable(value) !== comparable(item)));
        case "$ne": return values.every((value) => comparable(value) !== comparable(operand));
        case "$gte": return comparable(actual) >= comparable(operand);
        case "$lte": return comparable(actual) <= comparable(operand);
        case "$gt": return comparable(actual) > comparable(operand);
        case "$lt": return comparable(actual) < comparable(operand);
        case "$regex": {
          const expression = operand instanceof RegExp
            ? operand
            : new RegExp(String(operand), expected.$options || "");
          return values.some((value) => expression.test(String(value ?? "")));
        }
        case "$options": return true;
        default: return true;
      }
    });
  }
  if (Array.isArray(actual)) {
    return actual.some((value) => comparable(value) === comparable(expected));
  }
  return comparable(actual) === comparable(expected);
};

const matches = (record: JsonRecord, filter: Filter = {}): boolean =>
  Object.entries(filter).every(([key, expected]) => {
    if (key === "$or") return expected.some((condition: Filter) => matches(record, condition));
    if (key === "$and") return expected.every((condition: Filter) => matches(record, condition));
    return matchesValue(valueAt(record, key), expected);
  });

const applyProjection = (record: JsonRecord, selection: string, hidden: string[]) => {
  const fields = selection.split(/\s+/).filter(Boolean);
  const included = fields.filter((field) => !field.startsWith("-") && !field.startsWith("+"));
  const excluded = fields.filter((field) => field.startsWith("-")).map((field) => field.slice(1));
  const explicitlyIncluded = fields.filter((field) => field.startsWith("+")).map((field) => field.slice(1));
  let result: JsonRecord;

  if (included.length) {
    result = { _id: record._id };
    for (const field of [...included, ...explicitlyIncluded]) {
      if (valueAt(record, field) !== undefined) result[field] = valueAt(record, field);
    }
  } else {
    result = { ...record };
    for (const field of [...hidden, ...excluded]) delete result[field];
    for (const field of explicitlyIncluded) result[field] = record[field];
  }
  return result;
};

const populateRecord = async (record: JsonRecord, path: string, selection?: string): Promise<void> => {
  const parts = path.split(".");
  const relation = parts[0];
  const childPath = parts.slice(1).join(".");
  const relationModelName = relation === "user" ? "User" : relation === "products" || (relation === "items" && childPath === "product") ? "Product" : relation === "product" ? "Product" : undefined;
  if (!relationModelName) return;
  const model = models.get(relationModelName);
  if (!model) return;
  const populateOne = async (id: any) => {
    if (id == null) return id;
    const document = await model.findById(String(id)).lean();
    if (!document) return null;
    return selection ? applyProjection(document, selection, model.hiddenFields || []) : document;
  };

  if (relation === "items" && childPath === "product") {
    for (const item of record.items || []) item.product = await populateOne(item.product);
    return;
  }
  if (Array.isArray(record[relation])) {
    record[relation] = await Promise.all(record[relation].map(populateOne));
  } else {
    record[relation] = await populateOne(record[relation]);
  }
};

export class JsonDocument {
  [key: string]: any;
  private readonly collection: string;
  private readonly prefix: string;
  private readonly defaults: JsonRecord;
  private persisted: boolean;

  constructor(collection: string, prefix: string, defaults: JsonRecord, data: JsonRecord = {}, persisted = false, uniqueFields: string[] = []) {
    Object.defineProperties(this, {
      collection: { value: collection },
      prefix: { value: prefix },
      defaults: { value: defaults },
      persisted: { value: persisted, writable: true },
      uniqueFields: { value: uniqueFields },
    });
    Object.assign(this, clone(defaults), clone(data));
  }

  async save(_options?: unknown): Promise<this> {
    const records = await readData<JsonRecord>(this.collection);
    if (!this._id) this._id = await generateId(this.collection, this.prefix);
    for (const field of this.uniqueFields) {
      if (records.some((record) => String(record._id) !== String(this._id) && record[field] === this[field])) {
        const error: any = new Error(`${field} already exists`);
        error.code = 11000;
        error.keyPattern = { [field]: 1 };
        throw error;
      }
    }
    const now = new Date().toISOString();
    if (!this.createdAt) this.createdAt = now;
    this.updatedAt = now;
    const index = records.findIndex((record) => String(record._id) === String(this._id));
    if (index < 0) records.push(this.toObject());
    else records[index] = this.toObject();
    await writeData(this.collection, records);
    this.persisted = true;
    return this;
  }

  toObject(): JsonRecord {
    const result: JsonRecord = {};
    for (const [key, value] of Object.entries(this)) {
      if (!key.startsWith("_") || key === "_id") result[key] = clone(value);
    }
    return result;
  }

  async populate(path: string, selection?: string): Promise<this> {
    await populateRecord(this, path, selection);
    return this;
  }
}

class JsonQuery<T> implements PromiseLike<T> {
  private sortFields: Record<string, 1 | -1> = {};
  private offset = 0;
  private maximum = Infinity;
  private selection = "";
  private populatePaths: Array<{ path: string; selection?: string }> = [];
  private isLean = false;

  constructor(private readonly operation: () => Promise<any>, private readonly model: any) {}

  sort(fields: Record<string, 1 | -1>) { this.sortFields = fields; return this; }
  skip(count: number) { this.offset = count; return this; }
  limit(count: number) { this.maximum = count; return this; }
  select(fields: string) { this.selection = fields; return this; }
  populate(path: string, selection?: string) { this.populatePaths.push({ path, selection }); return this; }
  session(_session: unknown) { return this; }
  lean() { this.isLean = true; return this; }

  private async execute(): Promise<T> {
    let result = await this.operation();
    const isArray = Array.isArray(result);
    let records = isArray ? result : result == null ? [] : [result];

    if (this.sortFields && Object.keys(this.sortFields).length) {
      records = [...records].sort((left, right) => {
        for (const [field, direction] of Object.entries(this.sortFields)) {
          const a = comparable(valueAt(left, field));
          const b = comparable(valueAt(right, field));
          if (a < b) return -direction;
          if (a > b) return direction;
        }
        return 0;
      });
    }
    records = records.slice(this.offset, this.offset + this.maximum);

    for (const record of records) {
      for (const item of this.populatePaths) await populateRecord(record, item.path, item.selection);
    }

    if (this.isLean) {
      records = records.map((record) => applyProjection(record, this.selection, this.model.hiddenFields || []));
    } else {
      records = records.map((record) => {
        const projected = applyProjection(record, this.selection, this.model.hiddenFields || []);
        return new this.model(projected, true);
      });
    }
    result = isArray ? records : records[0] ?? null;
    return result as T;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export function createJsonModel(
  collection: string,
  prefix: string,
  defaults: JsonRecord = {},
  options: { hiddenFields?: string[]; uniqueFields?: string[] } = {}
) {
  class ModelDocument extends JsonDocument {
    constructor(data: JsonRecord = {}, persisted = false) {
      super(collection, prefix, defaults, data, persisted, options.uniqueFields || []);
    }
  }

  const model: any = ModelDocument;
  model.collectionName = collection;
  model.hiddenFields = options.hiddenFields || [];

  model.find = (filter: Filter = {}) => new JsonQuery(
    async () => (await readData<JsonRecord>(collection)).filter((record) => matches(record, filter)).map((record) => new model(record, true)), model
  );
  model.findOne = (filter: Filter = {}) => new JsonQuery(
    async () => {
      const record = (await readData<JsonRecord>(collection)).find((item) => matches(item, filter));
      return record ? new model(record, true) : null;
    }, model
  );
  model.findById = (id: string) => model.findOne({ _id: String(id) });
  model.countDocuments = async (filter: Filter = {}) => (await readData<JsonRecord>(collection)).filter((record) => matches(record, filter)).length;
  model.create = async (input: JsonRecord | JsonRecord[], _options?: unknown) => {
    if (Array.isArray(input)) return Promise.all(input.map((record) => model.create(record)));
    const document = new model(input);
    await document.save();
    return document;
  };
  model.findByIdAndUpdate = (id: string, update: JsonRecord) => new JsonQuery(async () => {
    const records = await readData<JsonRecord>(collection);
    const index = records.findIndex((record) => String(record._id) === String(id));
    if (index < 0) return null;
    const updated = { ...records[index] };
    const values = update.$set ? { ...update, ...update.$set } : update;
    delete values.$set;
    const unset = values.$unset || {};
    delete values.$unset;
    for (const field of options.uniqueFields || []) {
      if (values[field] !== undefined && records.some((record) => String(record._id) !== String(id) && record[field] === values[field])) {
        const error: any = new Error(`${field} already exists`);
        error.code = 11000;
        error.keyPattern = { [field]: 1 };
        throw error;
      }
    }
    Object.assign(updated, values);
    for (const field of Object.keys(unset)) delete updated[field];
    updated.updatedAt = new Date().toISOString();
    records[index] = updated;
    await writeData(collection, records);
    return new model(updated, true);
  }, model);
  model.findByIdAndDelete = (id: string) => new JsonQuery(async () => {
    const records = await readData<JsonRecord>(collection);
    const index = records.findIndex((record) => String(record._id) === String(id));
    if (index < 0) return null;
    const [removed] = records.splice(index, 1);
    await writeData(collection, records);
    return new model(removed, true);
  }, model);
  model.findOneAndUpdate = (filter: Filter, update: JsonRecord) => new JsonQuery(async () => {
    const found = (await readData<JsonRecord>(collection)).find((record) => matches(record, filter));
    if (!found) return null;
    return await model.findByIdAndUpdate(found._id, update);
  }, model);

  models.set(options === undefined ? collection : (options as any).modelName || collection, model);
  return model;
}

export function registerJsonModel(name: string, model: any): void {
  models.set(name, model);
}

export const startJsonTransaction = async () => ({
  withTransaction: async (operation: () => Promise<void>) => operation(),
  endSession: async () => undefined,
});