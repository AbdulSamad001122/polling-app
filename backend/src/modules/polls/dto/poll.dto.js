import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class PollDto extends BaseDto {
    static schema = Joi.object({
        title: Joi.string().trim().min(3).max(100).required(),
        questions: Joi.array().items(
            Joi.object({
                text: Joi.string().trim().min(3).required(),
                isRequired: Joi.boolean().default(false),
                options: Joi.array().items(
                    Joi.object({
                        text: Joi.string().trim().max(100).required()
                    })
                ).min(2).max(30).required()
            })
        ).min(1).max(50).required(),
        isAnonymous: Joi.boolean().default(false),
        isActive: Joi.boolean().default(true),
        isPublished: Joi.boolean().default(false),
        requiresAuth: Joi.boolean().default(false),
        expiresAt: Joi.date().iso().optional()
    });
}

export default PollDto;