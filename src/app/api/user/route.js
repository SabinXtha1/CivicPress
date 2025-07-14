import { connectDB } from "@/lib/db";
import { User, NoticeSms } from "@/lib/Schema/UserSchema";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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

export async function POST(req) {
    await connectDB();
    try {
        const { username, email, password, phone } = await req.json();

        if (!phone) {
            return NextResponse.json({ message: "Phone number is required" }, { status: 400 });
        }

        // Validate Nepali phone number format: +977 followed by 10 digits
        const nepaliPhoneNumberRegex = /^\+977\d{10}$/;
        if (!nepaliPhoneNumberRegex.test(phone)) {
            return NextResponse.json({ message: "Invalid Nepali phone number format. It should be +977XXXXXXXXXX." }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return NextResponse.json({ message: "User with this email or username already exists" }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            phone,
            
        });

        // Attempt to create a NoticeSms entry for the new user
        try {
            await NoticeSms.create({
                phoneNumber: phone,
                email: email,
            });
        } catch (smsError) {
            console.error("Error creating NoticeSms entry for new user:", smsError);
            // Continue with user registration success even if NoticeSms fails
        }

        return NextResponse.json({ message: "User registered successfully", user: newUser }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    await connectDB();
    const authResult = verifyToken(req);
    if (authResult.error) {
        return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    const { decoded } = authResult;

    if (decoded.role !== 'admin' && decoded.role !== 'editor') {
        return NextResponse.json({ message: "Forbidden: Only admins and editors can view users" }, { status: 403 });
    }

    try {
        const users = await User.find().select('-password'); // Exclude password from the results
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}