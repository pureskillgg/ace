import { equals } from '@meltwater/phi'
import { matchers } from 'testdouble'

const isAwsSdkCommand = matchers.create({
  name: 'isAwsSdkCommand',
  matches: function (matcherArgs, actual) {
    const [expected] = matcherArgs
    return equals(actual.input, expected.input)
  }
})

export const registerTestdoubleMatchers = (td) => {
  td.matchers.isAwsSdkCommand = isAwsSdkCommand
}
