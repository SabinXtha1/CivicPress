import { connectDB } from "@/lib/db";
import { Notice, NoticeSms } from "@/lib/Schema/UserSchema";
import { NextResponse } from "next/server";
import { revalidatePath } from 'next/cache';
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Helper function to verify JWT token
const verifyToken = (req) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
        return { error: "Authorization header missing", status: 401 };
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return { error: "Token missing", status: 401 };
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { decoded };
    } catch (error) {
        return { error: "Invalid or expired token", status: 403 };
    }
};

export async function GET(req) {
    await connectDB();
    try {
        const url = new URL(req.url);
        const last24Hours = url.searchParams.get('last24Hours');
        let query = {};

        if (last24Hours === 'true') {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            query.createdAt = { $gte: twentyFourHoursAgo };
        }

        const notices = await Notice.find(query).sort({ createdAt: -1 });
        return NextResponse.json(notices, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    await connectDB();
    const authResult = verifyToken(req);
    if (authResult.error) {
        return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    const { decoded } = authResult;

    if (decoded.role !== 'admin') {
        return NextResponse.json({ message: "Forbidden: Only admins can create notices" }, { status: 403 });
    }

    try {
        const { title, image } = await req.json();

        const newNotice = await Notice.create({
            title,
            image,
        });

        // Send email to all users in NoticeSms
        const noticeSmsUsers = await NoticeSms.find({});
        const emailList = noticeSmsUsers.map(user => user.email).filter(Boolean); // Filter out null/undefined emails

        if (emailList.length > 0) {
            const transporter = nodemailer.createTransport({
                service: "gmail", // You can use other services like "outlook", "yahoo", etc.
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: emailList.join(", "), // Send to all collected emails
                subject: `New Notice: ${title}`,
                html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p>Dear User,</p>
      <p>A new notice has been published:</p>
      <h3 style="color: #e63946; font-size: 24px; margin: 10px 0;">${title}</h3>
      ${image ? `
        <div style="margin: 15px 0;">
          <img src="${image}" alt="Notice Image" style="max-width: 100%; height: auto; border-radius: 8px;" />
        </div>
      ` : ""}
      <p>
        Please visit our website to view the full notice. <br/>
        <a href="https://ward-2.vercel.app/" style="color: #1d3557; text-decoration: none;">Click Here</a>
      </p>
      <p>Regards,<br><strong>Ward News Team</strong></p>
    </div>
  `,
            };


            try {
                await transporter.sendMail(mailOptions);
                console.log("Emails sent successfully to:", emailList);
            } catch (emailError) {
                console.error("Error sending emails:", emailError);
            }
        }

        revalidatePath('/notices');
        return NextResponse.json({ message: "Notice created successfully", notice: newNotice }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}