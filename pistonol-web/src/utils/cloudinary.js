export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', "newsimgupload");
  

    // formData.append('upload_preset', 'newsimgupload');
    // formData.append('cloud_name', 'dikxwu8om');


  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dikxwu8om/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await response.json();
    return {
      success: true,
      data: {
        url: data.secure_url,
        publicId: data.public_id
      }
    };
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: error.message
    };
  }
};