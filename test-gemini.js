const prompt = "Reply to this: Hi, how are you?";
const body = JSON.stringify({
  contents: [{
    parts: [{ text: prompt }]
  }]
});
console.log(body);
