module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "commonjs": true,
        "node": true
    },
    "parserOptions": {
        "ecmaVersion": 3
    },
    "rules": {
        "indent": [2, 2, {"SwitchCase": 1}],
        "eqeqeq": 2,
        "space-before-function-paren": 2,
        // "semi": 2,
        "key-spacing": [2, {
            "beforeColon": false,
            "afterColon": true
        }],
        "no-octal": 2,
        "no-redeclare": 2,
        "comma-spacing": 2,
        "no-new-object": 2,
        "arrow-spacing": 2,
        "quotes": [2, "single", {
            "avoidEscape": true,
            "allowTemplateLiterals": true
        }],

        "linebreak-style": [
            "error",
            "unix"
        ]
    }
};