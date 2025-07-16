import { connectDB } from "@/lib/db";
import { User } from "@/lib/Schema/UserSchema";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
    await connectDB();
    try {
        const { email, otp, newPassword } = await req.json();

        // 1. Find the user by email first
        const user = await User.findOne({ email });
        console.log("User found for verification:", user);

        if (!user) {
            // Security: It's better to give a generic error message 
            // to prevent attackers from guessing which emails are registered.
            return NextResponse.json({ message: "Invalid OTP or email" }, { status: 400 });
        }

        // 2. Check if the token is expired
        if (user.resetPasswordExpires < Date.now()) {
            return NextResponse.json({ message: "OTP has expired. Please request a new one." }, { status: 400 });
        }

        // 3. Check if the OTP matches
        console.log(`Comparing OTPs: (Received: ${otp}, Stored: ${user.resetPasswordToken})`);
        if (user.resetPasswordToken !== otp) {
            console.log(user.resetPasswordToken)
            return NextResponse.json({ message: "Invalid OTP. Please check the code and try again." }, { status: 400 });
        }

        // If all checks pass, reset the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}