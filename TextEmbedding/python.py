import os
from dotenv import load_dotenv
from openai import OpenAI # type: ignore

load_dotenv()

api_key = os.getenv("OPEN_API_KEY")

client = OpenAI(
    api_key=api_key
)


text = "Given two integer arrays, each of which is sorted in increasing order, merge them into a single array in increasing order, and return it.\n\nInput:\n4\n1 3 5 7\n3\n2 4 6\nOutput:\n1 2 3 4 5 6 7"


text = text.replace("\n", " ")

response = client.embeddings.create(
  model="text-embedding-ada-002",
  input=text
).data[0].embedding

print(response)