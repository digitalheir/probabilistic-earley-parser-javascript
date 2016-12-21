import {NonTerminal, Terminal} from "../../src/grammar/category";
import {Grammar} from "../../src/grammar/grammar";

import * as Mocha from 'mocha'
import {expect} from 'chai';
import {scan} from "../../src/earley/scan";
import {LogSemiring} from "semiring";
import {ss} from "./state-set.spec";

//TODO
describe('scan', () => {
    it('should scan correctly', () => {
        scan(
            0,
            "e",
            LogSemiring,
            ss
        )
    });
});
