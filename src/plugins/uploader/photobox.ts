import PicGo from '../../core/PicGo'
import { PluginConfig } from '../../utils/interfaces'

const postOptions = (fileName: string, image: Buffer): any => {
  return {
    method: 'POST',
    url: 'https://photobox.drink.cafe/upload',
    headers: {
      contentType: 'multipart/form-data',
      'User-Agent': 'PicGo',
    },
    formData: {
      file: {
        value: image,
        options: {
          filename: fileName
        }
      },
      ssl: 'true'
    }
  }
}

const handle = async (ctx: PicGo): Promise<PicGo> => {
  const imgList = ctx.output
  for (let i in imgList) {
    let image = imgList[i].buffer
    if (!image && imgList[i].base64Image) {
      image = Buffer.from(imgList[i].base64Image, 'base64')
    }
    const postConfig = postOptions(imgList[i].fileName, image)
    let body = await ctx.Request.request(postConfig)
    body = JSON.parse(body)
    if (body.data !== undefined) {
      delete imgList[i].base64Image
      delete imgList[i].buffer
      imgList[i]['imgUrl'] = body.data.url
    } else {
      ctx.emit('notification', {
        title: '上传失败',
        body: body.message
      })
      throw new Error(body.message)
    }
  }
  return ctx
}

const config = (ctx: PicGo): PluginConfig[] => {
  let userConfig = ctx.getConfig('picBed.photobox')
  if (!userConfig || typeof userConfig !== 'object') {
    userConfig = {}
  }
  const config = [
    {
      name: 'token',
      message: 'api token',
      type: 'input',
      default: userConfig.token || '',
      required: false
    }
  ]
  return config
}

export default {
  name: 'PhotoBox图床',
  handle,
  config
}
