import brcypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {
    inngest
} from "../inngest/client.js";

export const signup = async (req, res, next) => {
    const {
        email,
        password,
        skills = []
    } = req.body;
    try {
        const hashed = await brcypt.hash(password, 10);
        const user = await User.create({
            email,
            password: hashed,
            skills
        });


        await inngest.send({
            name: "user/signup",
            data: {
                email,
            },
        });

        const token = jwt.sign({
                _id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET
        );

        res.json({
            user,
            token
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    const {
        email,
        password
    } = req.body;

    try {
        const user = await User.findOne({
            email
        });
        if (!user) return res.status(401).json({
            error: "User not found"
        });

        const isMatch = await brcypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }

        const token = jwt.sign({
                _id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET
        );

        res.json({
            user,
            token
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({
            error: "Unauthorized"
        });
        await jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(401).json({
                error: "Unauthorized"
            });
        });
        res.json({
            message: "Logout successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    const {
        skills = [], role, email
    } = req.body;
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({
                eeor: "Forbidden"
            });
        }
        const user = await User.findOne({
            email
        });
        if (!user) return res.status(401).json({
            error: "User not found"
        });

        await User.updateOne({
            email
        }, {
            skills: skills.length ? skills : user.skills,
            role
        });
        return res.json({
            message: "User updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                error: "Forbidden"
            });
        }

        const users = await User.find().select("-password");
        return res.json(users);
    } catch (error) {
        next(error);
    }
};