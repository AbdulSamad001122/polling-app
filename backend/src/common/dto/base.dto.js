class BaseDto {
    static validate(data) {
        const { error, value } = this.schema.validate(data, {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        });

        if (error) {
            return {
                errors: error.details.map((detail) => detail.message),
                value: null,
            };
        }

        return { errors: null, value };
    }
}

export default BaseDto;
