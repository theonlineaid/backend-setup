import fs from 'fs';
import path from 'path';

const BASE_PATH = path.join(__dirname, '..', 'uploads');

// Create a directory if it does not exist
export const createUserFolder = (userName: string) => {
    const userFolderPath = path.join(BASE_PATH, userName);

    if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath, { recursive: true });
    }

    return userFolderPath;
};

// Delete a directory and its contents
export const deleteUserFolder = (userName: string) => {
    const userFolderPath = path.join(BASE_PATH, userName);

    if (fs.existsSync(userFolderPath)) {
        fs.rmSync(userFolderPath, { recursive: true, force: true });
    }
};
