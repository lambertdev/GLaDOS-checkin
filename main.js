const glados = async () => {
  const cookie = process.env.GLADOS
  if (!cookie) return
  try {
    const headers = {
      'cookie': cookie,
      'referer': 'https://www.glados.rocks/console/checkin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://glados.rocks'
    }
    const checkin = await fetch('https://glados.rocks/console/checkin', {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json;charset=UTF-8', 'Content-Length': '24' },
      body: '{token: "glados.rocks"}',
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
    return [
      'Checkin Error',
      `${error}`,
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
  
  // 将结果输出到 GitHub Actions 的日志中
  if (result && result.length > 0) {
    console.log('========== GLaDOS Checkin Result ==========')
    console.log(result.join('\n'))
    console.log('===========================================')
  } else {
    console.log('执行完毕，但没有产生结果。请检查环境变量设置。')
  }
  
  await notify(result)
}

main()
