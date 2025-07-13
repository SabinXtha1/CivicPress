import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, "Please fill a valid email address"]
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'editor'],
        default: 'user'
    }
}, { timestamps: true });

const commentSchema = new Schema({
    comment: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const likeSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    images: {
        type: [String],
        default: []
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    comments: [commentSchema],
    likes: [likeSchema]
}, { timestamps: true });

const noticeSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String
    }
}, { timestamps: true });

const noticeSmsSchema = new Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        match: [/.+\@.+\..+/, "Please fill a valid email address"],
        sparse: true // Allows null values to not violate unique constraint if email was unique
    }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
export const Notice = mongoose.models.Notice || mongoose.model("Notice", noticeSchema);
export const NoticeSms = mongoose.models.NoticeSms || mongoose.model("NoticeSms", noticeSmsSchema);
