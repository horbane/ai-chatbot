from openai import OpenAI

client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = "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"
)

completion = client.chat.completions.create(
  model="opengpt-x/teuken-7b-instruct-commercial-v0.4",
  messages=[{"role":"user","content":""}],
  temperature=0.7,
  top_p=0.9,
  max_tokens=512,
  extra_body={"chat_template":"EN"},
  stream=True
)

for chunk in completion:
  if chunk.choices[0].delta.content is not None:
    print(chunk.choices[0].delta.content, end="")

