import firebaseAdmin, { ServiceAccount } from 'firebase-admin'
const { v4: uuidv4 } = require('uuid')
//@ts-ignore
import serviceAccount from '../service-account.json'
import { config } from 'dotenv'

export default (() => {
  const uploadFileToFirebase = async (path: string, filename: string) => {
    try {
      config()
      const admin = firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(
          serviceAccount as ServiceAccount,
        ),
      })
      const storageRef = admin.storage().bucket(process.env.BUCKET || '')

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
