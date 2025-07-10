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

export async function POST(req) {
    await connectDB();
    const authResult = verifyToken(req);
    if (authResult.error) {
        return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    const { decoded } = authResult;

    try {
        const { postId } = await req.json();

        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        const userId = decoded.id;

        // Check if the user has already liked the post
        const alreadyLiked = post.likes.some(like => like.user.toString() === userId);

        if (alreadyLiked) {
            // Unlike the post
            post.likes = post.likes.filter(like => like.user.toString() !== userId);
            await post.save();
            return NextResponse.json({ message: "Post unliked successfully", likesCount: post.likes.length }, { status: 200 });
        } else {
            // Like the post
            post.likes.push({ user: userId });
            await post.save();
            return NextResponse.json({ message: "Post liked successfully", likesCount: post.likes.length }, { status: 201 });
        }

    } catch (error) {
        console.error("Error liking/unliking post:", error);
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}