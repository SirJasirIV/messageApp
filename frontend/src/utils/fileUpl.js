import { API_URL } from "./api";

async function uploadFile(file) {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_URL}/connect/upload`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.url;
}

export default uploadFile;