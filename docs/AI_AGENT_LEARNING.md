useChat returned:

input: undefined
handleInputChange: undefined
handleSubmit: undefined

Reason:
AI SDK v6 changed API.

Fix:
Use

chat.sendMessage()
chat.messages
chat.status


---

## Bug 2

```txt
toDataStreamResponse is not a function
Reason:

result.toDataStreamResponse()

does not exist in AI SDK v6.

Fix:

return result.toUIMessageStreamResponse();

Bug 3
messages.some is not a function

Reason:

AI SDK v6 sends UI Messages.

Fix:

const modelMessages =
 await convertToModelMessages(
   body.messages
 );

 Bug 4
Tool called with
{}
instead of
{name:"Virat Kohli"}

Reason:

Tool description was weak.

Fix:

z.string().describe(...)

and better system prompt.

Bug 5
Tool worked
UI showed nothing

Reason:

Frontend didn't render

tool-getCustomerByName

Fix:

Add renderer.