// Keeps a JSON snapshot of the library on disk (mirroring what's persisted to
// AsyncStorage) so the user has something they can grab and store elsewhere —
// there's no backend, so this file is the only way to back up or move data
// between installs.
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

export const BACKUP_FILE_URI = `${FileSystem.documentDirectory}arkive-backup.json`

export async function writeBackupFile(library) {
  await FileSystem.writeAsStringAsync(BACKUP_FILE_URI, JSON.stringify(library))
}

// Opens the native share sheet so the user can save/send the backup file
// wherever they like (Files, Drive, email, AirDrop...). Returns false if
// there's nothing to share yet or sharing isn't available on this device.
export async function shareBackup() {
  const info = await FileSystem.getInfoAsync(BACKUP_FILE_URI)
  if (!info.exists) return false
  if (!(await Sharing.isAvailableAsync())) return false

  await Sharing.shareAsync(BACKUP_FILE_URI, {
    mimeType: 'application/json',
    dialogTitle: 'Back up Arkive data',
  })
  return true
}
