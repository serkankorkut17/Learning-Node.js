const fs = require('fs');

const deleteFile = filePath => {
  fs.unlink(filePath, err => {
    if (err) {
      throw err;
    }
  });
};

const moveFile = (oldPath, newPath) => {
  fs.rename(oldPath, newPath, err => {
    if (err) {
      throw err;
    }
  });
};

exports.deleteFile = deleteFile;
exports.moveFile = moveFile;
