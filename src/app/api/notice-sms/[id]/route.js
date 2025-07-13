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

export async function PUT(req, { params }) {
    await connectDB();
    const authResult = verifyToken(req);
    if (authResult.error) {
        return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    const { decoded } = authResult;

    if (decoded.role !== 'admin') {
        return NextResponse.json({ message: "Forbidden: Only admins can update subscriptions" }, { status: 403 });
    }

    try {
        const { id } = params;
        const { phoneNumber, email } = await req.json();

        if (!phoneNumber) {
            return NextResponse.json({ message: "Phone number is required" }, { status: 400 });
        }

        const updatedSubscription = await NoticeSms.findByIdAndUpdate(
            id,
            { phoneNumber, email },
            { new: true, runValidators: true }
        );

        if (!updatedSubscription) {
            return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Subscription updated successfully", subscription: updatedSubscription }, { status: 200 });

    } catch (error) {
        console.error("Error updating subscription:", error);
        if (error.code === 11000) {
            return NextResponse.json({ message: "Phone number already exists" }, { status: 409 });
        }
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    await connectDB();
    const authResult = verifyToken(req);
    if (authResult.error) {
        return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    const { decoded } = authResult;

    if (decoded.role !== 'admin') {
        return NextResponse.json({ message: "Forbidden: Only admins can delete subscriptions" }, { status: 403 });
    }

    try {
        const { id } = params;

        const deletedSubscription = await NoticeSms.findByIdAndDelete(id);

        if (!deletedSubscription) {
            return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Subscription deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error deleting subscription:", error);
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}
