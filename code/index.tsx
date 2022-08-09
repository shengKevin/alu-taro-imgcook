import Taro from '@tarojs/taro'
import React, { Component } from 'react'
import { View, Image, Text } from '@tarojs/components'
import { Input, Button, RadioGroup, DatePicker } from '@taroify/core'

import styles from './index.module.scss'

import url0 from 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/94c37590281311ec957a13ebef7c3eed.png'
import url1 from 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/94ff6d20281311ecab360d21d0e524b2.png'
import url2 from 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/95b6d640281311ec9d962727f0cfbd76.png'
import url3 from 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/95496e70281311ecabe86dc0e796f79c.png'
import url4 from 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/95e5ae70281311ecbc6dc38184933ff1.png'
import url5 from 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/958713b0281311ec921d3d9daadbada1.png'
import url6 from 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/961f3500281311ec957a13ebef7c3eed.png'
import url7 from 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/964de620281311ec921d3d9daadbada1.png'
import url8 from 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/96ade070281311ecabe86dc0e796f79c.png'
import url9 from 'https://ai-sample.oss-cn-hangzhou.aliyuncs.com/test/967480f0281311ec8dc977d7cdf4ec37.png'

export default class Page1660038403064 extends Component {
  render() {
    return (
      <View className={styles.page}>
        <View className={styles.long - banner - wrapper}>
          <Image className={styles.long - banner} src={url0} />
        </View>
        <View className={styles.group}>
          <Image className={styles.picture} src={url1} />
        </View>
        <View className={styles.group - i0}>
          <Image className={styles.icon - mine} src={url2} />
          <Text className={styles.tag}>请输入账号</Text>
        </View>
        <View className={styles.group - 1}>
          <View className={styles.divider - wrapper}>
            <Image className={styles.divider} src={url3} />
          </View>
        </View>
        <View className={styles.group - i1}>
          <Image className={styles.icon - key} src={url4} />
          <Input placeholder={'请输入密码'} />
          <Button size={'small'} type={'primary'} htmlType={'submit'} id={'dd'}>
            你好
          </Button>
          undefinedundefined
        </View>
        <View className={styles.group - 2}>
          <View className={styles.divider - wrapper - 1}>
            <Image className={styles.divider - 1} src={url5} />
          </View>
        </View>
        <View className={styles.title - wrapper}>
          <Text className={styles.title}>登录</Text>
        </View>
        <View className={styles.group - 3}>
          <Text className={styles.word}>忘记密码？</Text>
          <Text className={styles.tag - 1}>新用户注册</Text>
        </View>
        <View className={styles.group - 4}>
          <View className={styles.primary}>
            <Image className={styles.text - background} src={url6} />
            <Text className={styles.info}>其他登陆方式</Text>
          </View>
          <View className={styles.side}>
            <Image className={styles.bg} src={url7} />
          </View>
        </View>
        <View className={styles.group - 5}>
          <Image className={styles.large - icon} src={url8} />
          <Image className={styles.large - icon - 1} src={url9} />
        </View>
      </View>
    )
  }
}
