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

export async function GET(req, { params }) {
    await connectDB();
    try {
        const { id } = params;
        const notice = await Notice.findById(id);

        if (!notice) {
            return NextResponse.json({ message: "Notice not found" }, { status: 404 });
        }

        return NextResponse.json(notice, { status: 200 });
    } catch (error) {
        console.error("Error fetching single notice:", error);
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    await connectDB();
    const authResult = verifyToken(req);
    if (authResult.error) {
        return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    const { decoded } = authResult;

    if (decoded.role !== 'admin') {
        return NextResponse.json({ message: "Forbidden: Only admins can update notices" }, { status: 403 });
    }

    try {
        const { id } = params;
        const updates = await req.json();

        const updatedNotice = await Notice.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedNotice) {
            return NextResponse.json({ message: "Notice not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Notice updated successfully", notice: updatedNotice }, { status: 200 });
    } catch (error) {
        console.error("Error updating notice:", error);
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
        return NextResponse.json({ message: "Forbidden: Only admins can delete notices" }, { status: 403 });
    }

    try {
        const { id } = params;
        const deletedNotice = await Notice.findByIdAndDelete(id);

        if (!deletedNotice) {
            return NextResponse.json({ message: "Notice not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Notice deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting notice:", error);
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}
