const generateChat = require("./generateChat");

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.body &&
        (req.body.startMode || req.body.messages))
    {
        const { startMode, messages } = req.body;

        try {
            const [chat, retriedCount] = await generateChat(startMode, messages);
            context.res = {
                status: 200,
                body: {
                    chat,
                    retriedCount
                },
                headers: {
                    "Content-Type": "application/json"
                }
            };
        }
        catch(ex) {
            context.res = {
                status: 500,
                body: {
                    status: 500,
                    message: ex.response ? ex.response.data : ex.message
                },
                headers: {
                    "Content-Type": "application/json"
                }
            };
        }
    }
    else {
        context.res = {
            status: 400,
            body: {
                errorMessage: "Cannot generate chat response when input is null"
            },
            headers: {
                "Content-Type": "application/json"
            }
        };
    }
};