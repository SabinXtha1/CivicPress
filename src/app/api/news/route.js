import { connectDB } from "@/lib/db";
import { Post } from "@/lib/Schema/UserSchema";
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

export async function GET(req) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const authorId = searchParams.get('authorId');

        let query = {};
        if (authorId) {
            const authResult = verifyToken(req);
            if (authResult.error) {
                return NextResponse.json({ message: authResult.error }, { status: authResult.status });
            }
            const { decoded } = authResult;

            if (decoded.id !== authorId && decoded.role !== 'admin' && decoded.role !== 'editor') {
                return NextResponse.json({ message: "Forbidden: You can only view your own posts" }, { status: 403 });
            }
            query = { author: authorId };
        }

        const posts = await Post.find(query).populate('author', 'username email').sort({ createdAt: -1 });
        return NextResponse.json(posts, { status: 200 });
    } catch (error) {
        console.error("Error fetching posts:", error);
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

    if (decoded.role !== 'admin' && decoded.role !== 'user') {
        return NextResponse.json({ message: "Forbidden: Only admins and editors can create posts" }, { status: 403 });
    }

    try {
        const { title, content, images, featured } = await req.json();

        const newPost = await Post.create({
            title,
            content,
            images,
            featured,
            author: decoded.id, // Set author to the ID from the token
        });

        return NextResponse.json({ message: "Post created successfully", post: newPost }, { status: 201 });

    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}