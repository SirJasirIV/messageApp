async function uploadFile(file) {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("http://localhost:3000/connect/upload", {
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