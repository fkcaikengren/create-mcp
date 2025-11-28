import { execSync } from 'node:child_process'

function run(cmd: string) {
  execSync(cmd, { stdio: 'inherit' })
}

async function main(){

  try {
    // 检查当前分支，禁止在main分支执行
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
    if (currentBranch === 'main') {
      console.error('❌ 禁止在main分支执行发布脚本！请在release分支或其他开发分支执行。')
      process.exit(1)
    }
    console.log(`📍 当前分支: ${currentBranch}`)
    // 首先进行构建测试，确保代码可以正常构建
    console.log('🔄 构建测试...')
    run('npm run build')
    
    // 只有在构建成功后才使用 standard-version 管理版本发布
    console.log('🔄 使用 standard-version 管理版本发布...')
    run('npx standard-version')
    
    // 发布到 npm 仓库
    console.log('🔄 发布到 npm 仓库...')
    run('npm publish')
    
    // 推送标签和代码到远程
    console.log('🔄 推送标签和代码到远程...')
    run('git push --follow-tags origin main')
    
    console.log('✅ 发布完成！')

    // 合并回到主分支，删除 release 分支
    run('git checkout main')
    run('git merge release')
    run('git push')
    run('git branch -d release')
    run('git push origin --delete release')
    console.log('✅ 合并到主分支并删除 release 分支完成！')

  } catch (e: any) {
    console.error('❌ 发布失败:', e.message)
    const code = typeof e?.status === 'number' ? e.status : 1
    process.exit(code)
  }

}

main();