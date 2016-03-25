<?php namespace core\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

abstract class AbstractBase extends Model
{

    // @see https://github.com/laravelbook/ardent
    public static $rules = array();

    public static $customMessages = array();

    public function validate(array $options = [])
    {
        $data = $this->getAttributes();
        $rules = $this->getRules();
        $customMessages = static::$customMessages;
        $validator = Validator::make($data, $rules, $customMessages);
        $success = $validator->passes();
        if (!$success) {
            return false;
        }
        return true;
    }

    public function save(array $options = [])
    {
        $data = $this->getAttributes();
        $rules = $this->getRules();
        $customMessages = static::$customMessages;
        $validator = Validator::make($data, $rules, $customMessages);
        $success = $validator->passes();
        if (!$success) {
            throw new InvalidModelException($validator->messages());
        }

        $user_id = 0;
        try {
            $user_id = \Auth::user()->id;
        } catch (\Exception $e) {
            // do nothing
        }

        if (!$this->exists) {
            $this->created_user_id = $user_id;
        }
        $this->updated_user_id = $user_id;


        return parent::save($options);
    }

    public function delete()
    {
        $user_id = 0;
        try {
            $user_id = \Auth::user()->id;
        } catch (\Exception $e) {
            // do nothing
        }
        $this->deleted_user_id = $user_id;
        $ret = $this->save();
        return parent::delete();
    }

    // @see https://github.com/laravelbook/ardent/blob/master/src/LaravelBook/Ardent/Ardent.php
    // protected function buildUniqueExclusionRules
    protected function getRules()
    {
        $rules = static::$rules;
        if (!$this->exists) {
            return $rules;
        }
        foreach ($rules as $field => &$ruleset) {
            $ruleset = (is_string($ruleset))? explode('|', $ruleset) : $ruleset;
            foreach ($ruleset as &$rule) {
                if (strpos($rule, 'unique:') === 0) {
                    $params = explode(',', $rule, 4);
                    $uniqueRules = array();

                    $table = explode(':', $params[0]);
                    if (count($table) == 1) {
                        $uniqueRules[1] = $this->getTable();
                    } else {
                        $uniqueRules[1] = $table[1];
                    }

                    if (count($params) == 1) {
                        $uniqueRules[2] = $field;
                    } else {
                        $uniqueRules[2] = $params[1];
                    }

                    if (isset($this->primaryKey)) {
                        $uniqueRules[3] = $this->{$this->primaryKey};

                        $uniqueRules[4] = isset($params[3]) ? $params[3] : $this->primaryKey;
                    } else {
                        $uniqueRules[3] = $this->id;
                    }

                    $rule = 'unique:' . implode(',', $uniqueRules);
                } elseif (strpos($rule, 'unique_with:') === 0) {
                    $uniqueRules = array();
                    if (isset($this->primaryKey)) {
                        $uniqueRules[3] = $this->{$this->primaryKey};

                        $uniqueRules[4] = isset($params[3]) ? $params[3] : $this->primaryKey;
                    } else {
                        $uniqueRules[3] = $this->id;
                    }
                    $rule = $rule. ','. implode('=', $uniqueRules);
                }
            }
        }
        return $rules;
    }
}
