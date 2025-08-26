"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
function getCurrentAcademicYear(startYear) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    let academicStartYear;
    if (currentMonth >= 10) {
        academicStartYear = currentYear;
    }
    else {
        academicStartYear = currentYear - 1;
    }
    return academicStartYear - startYear + 1;
}
const MemberSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    program: { type: String, required: true },
    voiceGroup: { type: String, required: true },
    academicStartYear: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                const currentYear = new Date().getFullYear();
                return v >= 2000 && v <= currentYear + 1;
            },
            message: 'Academic start year must be between 2000 and next year'
        }
    },
    studyDurationYears: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
        default: 3
    },
}, { timestamps: true });
MemberSchema.methods.getCurrentAcademicYear = function () {
    return getCurrentAcademicYear(this.academicStartYear);
};
MemberSchema.methods.hasCompletedStudies = function () {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const finalAcademicYear = this.academicStartYear + this.studyDurationYears - 1;
    const graduationYear = finalAcademicYear + 1;
    if (currentYear > graduationYear) {
        return true;
    }
    if (currentYear === graduationYear && currentMonth > 7) {
        return true;
    }
    return false;
};
MemberSchema.methods.getExpectedGraduationYear = function () {
    return this.academicStartYear + this.studyDurationYears - 1;
};
const Member = mongoose_1.default.models.Member || mongoose_1.default.model('Member', MemberSchema);
exports.default = Member;
