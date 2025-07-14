import { connectDB } from "@/lib/db";
import { Post } from "@/lib/Schema/UserSchema";
import { NextResponse } from "next/server";
import { revalidatePath } from 'next/cache';
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
        const post = await Post.findById(id).populate('author', 'username email').populate('comments.author', 'username');

        if (!post) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        return NextResponse.json(post, { status: 200 });
    } catch (error) {
        console.error("Error fetching single post:", error);
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

    const post = await Post.findById(id);
    if (!post) {
        return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Allow admin/editor or the original author to update the post
    if (decoded.role !== 'admin' && decoded.role !== 'editor' && decoded.id !== post.author.toString()) {
        return NextResponse.json({ message: "Forbidden: You are not authorized to update this post" }, { status: 403 });
    }

    try {
        const { id } = params;
        const updates = await req.json();

        const updatedPost = await Post.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedPost) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        revalidatePath('/posts');
        return NextResponse.json({ message: "Post updated successfully", post: updatedPost }, { status: 200 });
    } catch (error) {
        console.error("Error updating post:", error);
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

    try {
        const { id } = params;
        const deletedPost = await Post.findById(id);

        if (!deletedPost) {
            return NextResponse.json({ message: "Post not found" }, { status: 404 });
        }

        // Allow admin/editor or the original author to delete the post
        if (decoded.role !== 'admin' && decoded.role !== 'editor' && decoded.id !== deletedPost.author.toString()) {
            return NextResponse.json({ message: "Forbidden: You are not authorized to delete this post" }, { status: 403 });
        }

        await Post.findByIdAndDelete(id);
        revalidatePath('/posts');
        return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 500 });
    }
}