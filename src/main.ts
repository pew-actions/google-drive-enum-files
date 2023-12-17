import * as fs from 'fs'
import * as core from '@actions/core'
import * as actions from '@actions/core'
import { google } from 'googleapis'

async function main(): Promise<void>{
  const credentials = actions.getInput('credentials', { required: true })

  const credentialsJSON = JSON.parse(credentials)
  const scopes = ['https://www.googleapis.com/auth/drive.metadata.readonly']
  const auth = new google.auth
      .JWT(credentialsJSON.client_email, undefined, credentialsJSON.private_key, scopes, undefined)
  const drive = google.drive({ version: 'v3', auth })

  const parentFolderId = core.getInput('folder-id')
  if (!parentFolderId) {
    throw 'No parentFolderId passed to the action'
  }

  const { data: { files } } = await drive.files.list({
    q: `'${parentFolderId}' in parents and trashed = false`,
    fields: 'files(id)',
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  });

  const result = {
    files: files,
  }

  core.setOutput('results', JSON.stringify(result))
}


try {
  main()
} catch (err: any) {
  if (err instanceof Error) {
    const error = err as Error;
    core.setFailed(error.message);
  } else {
    throw(err)
  }
}
