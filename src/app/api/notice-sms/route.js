import { connectDB } from "@/lib/db";
import { NoticeSms } from "@/lib/Schema/UserSchema";
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
        const { phoneNumber, email } = await req.json();

        if (!phoneNumber) {
            return NextResponse.json({ message: "Phone number is required" }, { status: 400 });
        }

        const newSubscription = await NoticeSms.create({
            phoneNumber,
            email,
        });

        return NextResponse.json({ message: "Subscription created successfully", subscription: newSubscription }, { status: 201 });

    } catch (error) {
        console.error("Error creating subscription:", error);
        if (error.code === 11000) {
            return NextResponse.json({ message: "Phone number already subscribed" }, { status: 409 });
        }
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

    if (decoded.role !== 'admin') {
        return NextResponse.json({ message: "Forbidden: Only admins can view subscriptions" }, { status: 403 });
    }

    try {
        const subscriptions = await NoticeSms.find().sort({ createdAt: -1 });
        return NextResponse.json(subscriptions, { status: 200 });
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}
