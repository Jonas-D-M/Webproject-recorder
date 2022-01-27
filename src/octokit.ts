import { existsSync } from 'fs'
import { searchDir } from './utils'
import * as core from '@actions/core'
import github from '@actions/github'
import { Octokit } from '@octokit/core'
import { PaginateInterface } from '@octokit/plugin-paginate-rest'
import { Api } from '@octokit/plugin-rest-endpoint-methods/dist-types/types'

interface ICommit {
  owner: string
  repo: string
  message: string
  tree: string
  author: {
    name: string
    email: string
  }
}

export default (() => {
  let octoKit: Octokit &
    Api & {
      paginate: PaginateInterface
    }

  const initOctokit = (token: string) => {
    octoKit = github.getOctokit(token)
  }

  const createCommit = async () => {
    // github.actor
    // github.repository_owner
    // github.repository
    // github.sha
    const context = github.context

    const { data: authors } = await octoKit.rest.migrations.getCommitAuthors({
      owner: context.repo.owner,
      repo: context.repo.repo,
    })

    const commit: ICommit = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      message: 'Create showcase video',
      tree: context.sha,
      author: {
        email: authors[0].email,
        name: authors[0].name,
      },
    }

    console.log(commit)

    await octoKit.rest.git.createCommit({ ...commit })
  }

  const appendToReadme = () => {}

  const createNewReadme = () => {}

  const uploadVideo = () => {}

  return { initOctokit, createCommit }
})()
