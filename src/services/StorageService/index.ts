import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { fbStorage } from "../../config";

export const StorageService = {
  uploadFile: async (file: File): Promise<string> => {
    const date = new Date();
    let filePath = `files/${date.getTime()}_${file.name}`;

    // Determine the file type and set the appropriate path
    if (file.type.startsWith("image/")) {
      filePath = `images/${date.getTime()}_${file.name}`;
    } else if (file.type.startsWith("video/")) {
      filePath = `videos/${date.getTime()}_${file.name}`;
    }

    const fileRef = ref(fbStorage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(`Something went wrong! ${error.code}`);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  },
  replaceFile: async (fileName: string, newFile: File): Promise<string> => {
    // Determine the file type and set the appropriate path
    let directory = "files";
    if (newFile.type.startsWith("image/")) {
      directory = "images";
    } else if (newFile.type.startsWith("video/")) {
      directory = "videos";
    }

    // Construct the file path using the directory and fileName
    const filePath = `${directory}/${fileName}`;
    const fileRef = ref(fbStorage, filePath);

    // Upload the new file to the same path, overwriting the old one
    const uploadTask = uploadBytesResumable(fileRef, newFile);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(`Something went wrong! ${error.code}`);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  },
  getFileNameFromUrl : (url: string): string => {
    const parts = url.split('/');
    return parts[parts.length - 1].split('?')[0];
  },
  
  
};
