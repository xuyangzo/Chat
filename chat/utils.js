function isNullOrEmpty(obj) {
    return obj === null ||
           obj === undefined ||
           (typeof obj == "string" && obj.trim().length === 0) ||
           (Array.isArray(obj) && obj.length === 0);
};

module.exports = {
    isNullOrEmpty
};