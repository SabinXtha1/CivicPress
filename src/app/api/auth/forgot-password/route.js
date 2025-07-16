import { connectDB } from "@/lib/db";
import { User } from "@/lib/Schema/UserSchema";
import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function POST(req) {
    await connectDB();
    try {
        const { email } = await req.json();
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 3600000; // 1 hour

        // Use a direct updateOne command
        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    resetPasswordToken: otp,
                    resetPasswordExpires: otpExpires,
                },
            }
        );

        // Re-fetch the user to confirm the update
        const updatedUser = await User.findById(user._id);
        console.log("User after saving OTP (re-fetched):", updatedUser);

        if (!updatedUser || !updatedUser.resetPasswordToken) {
            throw new Error("Failed to save OTP to the database.");
        }

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset OTP',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nYour OTP is: ${otp}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: "OTP sent to your email" }, { status: 200 });
    } catch (error) {
        console.error("Error in forgot-password route:", error);
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}