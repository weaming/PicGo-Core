import PicGo from '../../core/PicGo'
import SMMSUploader from './smms'
import tcYunUploader from './tcyun'
import githubUploader from './github'
import qiniuUploader from './qiniu'
import imgurUploader from './imgur'
import aliYunUploader from './aliyun'
import upYunUploader from './upyun'
import photoBoxUploader from './photobox'

export default (ctx: PicGo): void => {
  ctx.helper.uploader.register('smms', SMMSUploader)
  ctx.helper.uploader.register('tcyun', tcYunUploader)
  ctx.helper.uploader.register('github', githubUploader)
  ctx.helper.uploader.register('qiniu', qiniuUploader)
  ctx.helper.uploader.register('imgur', imgurUploader)
  ctx.helper.uploader.register('aliyun', aliYunUploader)
  ctx.helper.uploader.register('upyun', upYunUploader)
  ctx.helper.uploader.register('photobox', photoBoxUploader)
}
