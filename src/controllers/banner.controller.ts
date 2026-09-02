import { Request, Response } from "express";
import { Banner } from "../models/banner.model.js";
export const getBanners = async (
  _req: Request,
  res: Response
) => {
  try {
    const banners = await Banner.find({
      isActive: true,
    })
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .lean();

    const data = banners.map((banner) => ({
      ...banner,
      _id: banner._id.toString(),
    }));

    return res.status(200).json({
      success: true,
      message: "Banners fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Get banners error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
    });
  }
};