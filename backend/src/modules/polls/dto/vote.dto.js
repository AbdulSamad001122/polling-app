import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class VoteDto extends BaseDto {
    static schema = Joi.object({
        answers: Joi.array().items(
            Joi.object({
                questionId: Joi.string().required(),
                optionId: Joi.string().required()
            })
        ).min(1).max(50).required()
    });
}

export default VoteDto;
