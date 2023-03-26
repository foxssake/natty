import { NattyConfig } from '../src/config.mjs'
import { Natty } from '../src/natty.mjs'

const natty = new Natty(new NattyConfig())
natty.start()
