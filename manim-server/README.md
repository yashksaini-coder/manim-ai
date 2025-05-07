## 📦 Installation

### Prerequisites

Altough Docker is not required, it is recommended to make sure you have the necessary tools to render videos or to generate code.

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Manim](https://docs.manim.community/en/stable/installation.html)

And, depending on the model you want to use, you will need to have an API key for the model provider.

- [OpenAI](https://openai.com/api/)
- [Groq](https://www.groq.com/api)

```bash
export OPENAI_API_KEY="your_openai_api_key"
export GROQ_API_KEY="your_groq_api_key"
```

### Steps

1. **Clone the repository:**

```bash
git clone https://github.com/marcelo-earth/generative-manim.git
```

2. **Install the requirements on the `/api` directory:**

```bash
cd api
pip install -r requirements.txt
```

Now you have the option of running the API locally or using Docker.

### Running the API locally

3. Run the `run.py` script to start the API server.

### Running the API using Docker

**Build the Docker image:**

3. Run the following command from the root directory of the repository.

```bash
cd generative-manim
docker build -t manim-server-api .
```

4. **Run the Docker container:**

```bash
docker run -p 5000:5000 manim-server-api
```

5. You have the API running.
