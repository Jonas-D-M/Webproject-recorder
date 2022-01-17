import firebaseAdmin from 'firebase-admin'
const { v4: uuidv4 } = require('uuid')

export default (() => {
  const uploadFileToFirebase = async (
    serviceAccount: any,
    bucket: string,
    path: string,
    filename: string,
  ) => {
    try {
      const admin = firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
      })
      const storageRef = admin.storage().bucket(bucket)

      const storage = await storageRef.upload(path, {
        public: true,
        destination: `${filename}`,
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
        },
      })
      return storage[0].metadata.mediaLink
    } catch (error) {
      throw error
    }
  }

  return { uploadFileToFirebase }
})()
