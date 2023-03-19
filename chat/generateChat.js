const { femaleOwnerPrompt, ownerPrompt } = require("./prompt");
const { isNullOrEmpty } = require("./utils");
const axios = require("axios");
require('dotenv').config();

// Configuration
const apiKey = process.env.OPENAI_API_KEY;

// Generate chat response
async function generateChat(startMode, messages) {
	// Setting parameter value
	const temperature = 0.7;
	const maxTokens = 2048;
	const topP = 1
	const frequencyPenalty = 0;
	const presencePenalty = 0;
    const n = 1;

    try {
        const args = {
            messages: generateMessages(startMode, messages),
            temperature,
            maxTokens,
            topP,
            n,
            frequencyPenalty,
            presencePenalty
        };
    	
		return await execute(args, 3);
    }
    catch (ex) {
        throw ex;
    }
}

// Execute summary generation by calling openai's API
async function execute(args, retryCount) {
    try {
        const { messages, temperature, maxTokens, topP, frequencyPenalty, presencePenalty } = args;
        const response = await axios({
            method: "post",
            url: "https://api.openai.com/v1/chat/completions",
            data: {
                messages,
                model: "gpt-3.5-turbo",
                temperature: temperature,
                max_tokens: maxTokens,
                top_p: topP,
                frequency_penalty: frequencyPenalty,
                presence_penalty: presencePenalty
            },
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
          
        if (response &&
            response.data &&
            response.data.choices &&
            response.data.choices.length > 0)
        {
            return [parseChat(response.data), 3-retryCount];
        }

        // There are no meaningful data in the response. Should throw
        const errMessage = "Cannot generate response.";
		const ex = new Error(errMessage);
		ex.response = {
			data: {
				message: errMessage
			}
		};
		throw ex;
	}
	catch (ex) {
        retryCount--;
        
		// We do not process anymore
		if (retryCount === 0) {
			console.error(ex.response ? ex.response.data : ex);
			throw ex;
		}
		// Keep retrying
        else {
            console.error(`Retrying! RetryCount remaining: ${retryCount}`);
			return await execute(args, retryCount);
		}
	}
}

function parseChat(data) {
    return {
        id: data.id,
        content: data.choices[0].message.content
    }
}

function generateMessages(startMode, chat) {
    if (isNullOrEmpty(startMode) && !isNullOrEmpty(chat)) {
        return chat;
    }

    let messages = [];
    if (!isNullOrEmpty(startMode)) {
        switch(startMode) {
            case "owner":
                messages = [
                    {
                        role: "system",
                        content: "你要扮演一个男朋友的角色。"
                    },
                    {
                        role: "user",
                        content: ownerPrompt
                    },
                    {
                        role: "assistant",
                        content: "好呀好呀。"
                    }
                ];
                break;
    
            case "female_owner":
                messages = [
                    {
                        role: "system",
                        content: "你要扮演一个女朋友的角色。"
                    },
                    {
                        role: "user",
                        content: femaleOwnerPrompt
                    },
                    {
                        role: "assistant",
                        content: "好呀好呀。"
                    }
                ];
                break;
    
            case "default":
                break;
    
            default:
                break;
        }
    }
    

    return messages.concat(chat);
}

module.exports = generateChat;