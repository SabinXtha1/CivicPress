import { connectDB } from "@/lib/db";
import { Notice } from "@/lib/Schema/UserSchema";
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

export async function GET() {
    await connectDB();
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        return NextResponse.json(notices, { status: 200 });
    } catch (error) {
        console.error("Error fetching notices:", error);
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

        return NextResponse.json({ message: "Notice created successfully", notice: newNotice }, { status: 201 });

    } catch (error) {
        console.error("Error creating notice:", error);
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}