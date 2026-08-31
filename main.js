const glados = async () => {
  const cookie = process.env.GLADOS
  if (!cookie) {
    console.log('未检测到 GLADOS 环境变量，跳过执行。')
    return
  }
  try {
    const headers = {
      'cookie': cookie,
      'origin': 'https://glados.rocks',
      'referer': 'https://glados.rocks/console/checkin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept': 'application/json, text/plain, */*'
    }
    
    // 修改 1：修正 URL 为实际抓包的 API 地址
    const checkin = await fetch('https://glados.rocks/api/user/checkin', {
      method: 'POST',
      // 修改 2：移除手动硬编码的 Content-Length，Node.js fetch 会自动计算正确的长度 (24)
      headers: { ...headers, 'content-type': 'application/json;charset=UTF-8' },
      body: '{"token":"glados.rocks"}',
    }).then((r) => r.json())
    
    const status = await fetch('https://glados.rocks/api/user/status', {
      method: 'GET',
      headers,
    }).then((r) => r.json())
    
    return [
      'Checkin OK',
      `${checkin.message}`,
      `Left Days ${Number(status.data.leftDays)}`,
    ]
  } catch (error) {
    // 修改 3：打印极其详细的错误信息，方便在 GitHub Actions 中排查
    console.error('===== 捕获到 Checkin Error =====')
    console.error('错误名称:', error.name)
    console.error('错误信息:', error.message)
    if (error.cause) {
      console.error('错误原因:', error.cause)
    }
    console.error('完整堆栈:', error.stack)
    console.error('================================')
    
    // 优化返回的错误消息格式
    const errorMsg = error.cause ? error.cause.message || error.cause : String(error)
    return [
      'Checkin Error',
      `${error.message} (Cause: ${errorMsg})`,
      `<${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}>`,
    ]
  }
}

const notify = async (contents) => {
  const token = process.env.NOTIFY
  if (!token || !contents) return
  //await fetch(`https://www.pushplus.plus/send`, {
  await fetch(`https://sctapi.ftqq.com/SCT220061Tq2WMzBNOkSHlPsQTpJkSzIOU.send`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
    //  token,
      title: contents[0],
      desp: contents.join('\n\n')
    //  content: contents.join('<br>'),
    //  template: 'markdown',
    }),
  })
}

const main = async () => {
  const result = await glados()
  
  if (result && result.length > 0) {
    console.log('::group::GLaDOS Checkin Result')
    console.log(result.join('\n'))
    console.log('::endgroup::')
  } else {
    console.log('执行完毕，但没有产生结果。请检查环境变量设置。')
  }
  
  await notify(result)
}

main()
