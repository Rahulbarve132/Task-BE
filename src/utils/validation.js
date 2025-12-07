const validateTaskFields = (req) => {
    const allowedFields = ['title', 'description', 'dueDate', 'priority', 'status'];
    const isEditAllowed = Object.keys(req.body).every(field => allowedFields.includes(field));
    return isEditAllowed;
}
 
module.exports = { validateTaskFields };