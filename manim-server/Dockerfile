FROM python:3.12-slim-bookworm

WORKDIR /app

# Copy the application into the container.
COPY . /app

# The installer requires curl (and certificates) to download the release archive
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates

# Download the latest installer
ADD https://astral.sh/uv/install.sh /uv-installer.sh

# Run the installer then remove it

RUN sh /uv-installer.sh && rm /uv-installer.sh

# Ensure the installed binary is on the `PATH`
ENV PATH="/root/.local/bin:$PATH"

# Install the application dependencies.
RUN uv sync --frozen --no-cache

# Run the application.
CMD ["uv", "run", "app.py"]