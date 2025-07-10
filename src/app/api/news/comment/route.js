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
        const { postId, comment } = await req.json();

        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        post.comments.push({
            comment,
            author: decoded.id,
        });

        await post.save();

        // Optionally, populate the author for the newly added comment to return it
        const populatedPost = await Post.findById(postId).populate('comments.author', 'username');
        const newComment = populatedPost.comments[populatedPost.comments.length - 1];

        return NextResponse.json({ message: "Comment added successfully", comment: newComment }, { status: 201 });

    } catch (error) {
        console.error("Error adding comment:", error);
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}