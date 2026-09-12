"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = exports.signJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const privateKey = `-----BEGIN PRIVATE KEY-----
MIIJQgIBADANBgkqhkiG9w0BAQEFAASCCSwwggkoAgEAAoICAQCveu+T7j/1a8LY
HpJxOvBxlTguDUDHabhBcFATKfg/pGedxBhhW5VgE/N6vYMunucRJrIRaBl810vP
0VhnNfdfwvzvEVGSnNkoC+JCepFtpyRpVHWqB6co8a+TyU4x517LpSuEJCmE8DNI
4uJrW1oKqo6f0257+7HZwYBRN4o1c7lPsQrhnGUnCU8Dwh19m/Xp8R0wxWkjd+J1
GhWTpY7pCXw3t2LoKfH6nrubOVlqXHrAF/iQ5I036rYRqdQSjG75FMF8UTnnHSIb
Z3Y8cugyvgbMBOQ+qO+OjdRAMN461827PeDaFkktjcDaFisUt2zCQITT1HkgDoMa
HXwtzVvYWyuhTP2RhD/qSYQrQYAlA0tyfsqGpalWqldPJGLUkF6wKPDE2mjnKara
apvFyxXJ1Sl+1cmqzgR9rGZhtwFwOmsieVyj3fe4IzImyrLm+pzGEnjPM8JHvg8f
LW7gbjfZw6KjIapIMDEiCUcjX7+Wx7RZX7QapDmvw0T2nmrMviaNZ5B1hDmDwt6w
MGZ56If2LAg98rIx+nrOTg2qVKvaWJecfK6UWJwJoHc9TgYGoGhX0k6jAnBq0II9
lj1QZEEcleCdSPipC6ModChTKVveWpgQ1l1QIkuXcnDz+24C5NTowq9dKlusA8tk
DMLFP17MRQrqyUJGCkiqWitFVdWP+QIDAQABAoICAA5hr84iy/LeF7BM9CFLzG4w
pbOvgiA9v7w8O1HQwh/cJmJRkpJzFi9TP0SPUNeirgsTresbiiA3SGcyL/G4hGtA
oKhqtdHjYTBFJhBe+XmARe2Mfp62ZRqn0SUWbd5M6THdOe9o4865fWiDML2N9XeT
kiAS7NaEMqenMlAlskHud7DqcHr8TXV5L7S+BVr4q9s2F7d6LGNb5U9F2aAZxNhA
PuIVmWlv2503wmYmuXdsOCKzbDuawaCkL7MLpT32bLdk/jUFNq7EblnK3U+3tqRG
+ulgWsDwaT64jL1MjAAMVPf8KqgRBMMTH6u3/qSiYktazJAMVTd9fPzoTve1gYn7
JyS5BYwwWo9IWmzR2/Eul6cCL+O4B2CEPht4pWfqgvNX9p9CWwHsKBwKkuG/XylF
vNbEUZxq6YjsKm7XjZpy12nvmmy7MG1LDT/g2EYj68QRe2jVvRXtxSnw8M6zAXNh
D6+HVPF5phE917qer8O+yk9iOgibGA5FgP43oldgNXNelRDL5F8VXcZe/OIoxmCd
sw13HF9DDI+7iv0FtguvBSM5Kq7K7oaYDbQ2apTzt7pEVSnmhdnAW8Jf3Fps8DY8
+XN2Fd2/eYTAnwWK80SF9EipahZktmWUhwWJTb+YpDs4ngzDBqcHDZrajknj6Xy3
Iycq3ekJLFI0dFr7nfZxAoIBAQDxtd6xquXYwILBZGMr2wIkG+MPH7Wro3UdQ1Vs
MuyaoN0pQeF1LYZmJRGmcQnCTgSUGMV2qKcaU1aZ+TeVejVXvzfxhi/9ybVT1nnv
1TIbKv3haMD46qekLIAiRLBN1UMv6pbQ7R7hlzBMtaeQTohel+WeEtv6FH90ypUu
/CtmUkCuuAJT98md7gj4IjlhY985jHM3S9xV5IYust4V7wiyRZ/nzsOOHyYpBiHF
ajBEhhSpm80/cNDXG/9kV6/Sb32aY39gAVrA7jEji8sqnZORcLzym+ptBs/ke4BM
38sF3xUl6PCEqwctxc1l9tQYcT2NpDiPaiO1GFWsGQNaMTmJAoIBAQC52rb8tThc
mUvhPiDUfwKpktkQblTYG1Cj4m0iLQ4owiaH7u+M5egCcPPNcmW0slDNXCAnWiBd
HBvR8LfQTWvrrikxmv1sb7C/nZhwZ7UXBew8gLI6iUjTkrGIFnF04JCniAxEUwC6
6vOYADX4o6Wm+ubMplWyghzZ/ynA9KZtu3/qbF6fzujubVghLhN9zapPL0GfrIwQ
qGFFcbVW/QyCa9TyoWRRbzC8ON8LYsw/BxaP5YrhoJp7imtffjLIlpClIKrBmWnD
yUDf+/80qhKa7i/gmQ3seLkwHm0tpro1anmCFU4lTcov/vS5Jtkyuu8gEuKsd+QI
wdr/ObH/H7bxAoIBAQCVvxEajUAcyxe27JSsJODssgI36nNIxNnXqVGQ2PPQ0Hx0
BQbC69NqEOkgbsOXB3K6taYQX2g3XQ44EjgneTD3DdaA4Zt15bNbH3Mn7LNANaBY
N+flzqrRgWhY0qlPbyJS20lYYq9RH7Oisp//PUgrInv1NMXn5y8XkjJei4fvumGs
XP/EOa1FFKWl5L4b4h33r1XqGiuFYzDmWZZRjGec2pm4qVZqBE5F+DCP97uzmEXQ
1l+QQDqCKixNZC3fd4cfUSkmt3AcOvViikbyPfGgl3HX9FSF+0Rszz6rYbKMDqsx
c2EfMD4gU31vAD5ibjWuPOF1qFI67bqWBmEXTYvRAoIBAG0RSWmr/9N3suwQRbvu
fWV+ZBwcY3YfMYe7jUgNIM4SggIr2jDZivpDxw++HqmYK4sYkVYGsg9yO3FMztJT
XQ4GOu59glNsiFEq7xaoBcHpG+W1sOJhRnfDEqRGZ3argriOQoSmITuQPjvpg8LS
ZphDjcZzpr8HVF8qOxqdeD3VVw//YNhv2IpzaNCv9YhSdavak6xc2iW8arkSLdVK
01iGZ4Wr6O9RTUxoI5zO8gXa5wazMnmOgpoVdUWpDaxhj6kYLp1GpqbbKFNJ007Y
r+pz9Wzc5Srs/eCbOn8b5RML1Rrd3epOaGUaPguaHMSEp2gvLQ8BnLT27snw1eBe
gEECggEAau7Ivm6uLCwNaaxviohMHRqJXh/cqkJu7Z6dAWo+2aEmrHAUAhYJ/dEn
OYHtPi5fxOa5NCcSrIioPTwOfMhwqlat2YPW/5FDkDTmTJZbeomh76qLUILebiFP
lwZ6x380I8NtU4uMxcogkg0xlpojtsp1yPa4bytjr1uMDdpuZ/Lc1QmFoao23zPW
fFMe9eLU8y73xUNn04oEEpIMICm0qMye6dSLL+l0BQogxOuJvTj+vLUmeFx0P74a
7Hig79Mz7RydULTlA+/2VhIk/R00GtxyJAcH2UBDzIOqJ0plCNfI7mO5y0jqqVdE
mrL2yJiSgGlbs+2GzSOGSIkm8JtCtw==
-----END PRIVATE KEY-----`;
const publicKey = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAr3rvk+4/9WvC2B6ScTrw
cZU4Lg1Ax2m4QXBQEyn4P6RnncQYYVuVYBPzer2DLp7nESayEWgZfNdLz9FYZzX3
X8L87xFRkpzZKAviQnqRbackaVR1qgenKPGvk8lOMedey6UrhCQphPAzSOLia1ta
CqqOn9Nue/ux2cGAUTeKNXO5T7EK4ZxlJwlPA8IdfZv16fEdMMVpI3fidRoVk6WO
6Ql8N7di6Cnx+p67mzlZalx6wBf4kOSNN+q2EanUEoxu+RTBfFE55x0iG2d2PHLo
Mr4GzATkPqjvjo3UQDDeOtfNuz3g2hZJLY3A2hYrFLdswkCE09R5IA6DGh18Lc1b
2FsroUz9kYQ/6kmEK0GAJQNLcn7KhqWpVqpXTyRi1JBesCjwxNpo5ymq2mqbxcsV
ydUpftXJqs4EfaxmYbcBcDprInlco933uCMyJsqy5vqcxhJ4zzPCR74PHy1u4G43
2cOioyGqSDAxIglHI1+/lse0WV+0GqQ5r8NE9p5qzL4mjWeQdYQ5g8LesDBmeeiH
9iwIPfKyMfp6zk4NqlSr2liXnHyulFicCaB3PU4GBqBoV9JOowJwatCCPZY9UGRB
HJXgnUj4qQujKHQoUylb3lqYENZdUCJLl3Jw8/tuAuTU6MKvXSpbrAPLZAzCxT9e
zEUK6slCRgpIqlorRVXVj/kCAwEAAQ==
-----END PUBLIC KEY-----`;
// sign jwt
const signJWT = async (payload, expiresIn) => jsonwebtoken_1.default.sign(payload, privateKey, { algorithm: 'RS256' });
exports.signJWT = signJWT;
// verify jwt
const verifyJWT = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, publicKey);
        return { payload: decoded, expired: false, token };
    }
    catch (error) {
        return {
            payload: null,
            expired: error.message.includes('Jwt token was expired'),
        };
    }
};
exports.verifyJWT = verifyJWT;
//# sourceMappingURL=jwt.utils.js.map