<?php

class CoreAnnounceControllerTest extends AbstractApiCommonControllerTest
{
    use TraitShowTest;
    use TraitIndexTest;
    use TraitStoreTest;
    use TraitDestroyTest;

    public static $unset_columns = [
        'start_date',
        'updated_at', 'updated_user_id',
        'created_at', 'created_user_id',
        'deleted_at', 'deleted_user_id',
    ];

    protected $attributes = [
        'title' => 'テスト',
        'body' => 'テスト<br /><a href="xxxx">test</a>',
        'html_flg' => "1",
        'start_date' => '2014-01-01 00:00:00',
        'end_date' => '2015-01-01 00:00:00',
    ];

    protected $targetId = 2;

    protected function getKlass()
    {
        list($url, $seeder, $model) = parent::getKlass();
        $url = 'announce';
        $seeder = 'CoreAnnounceTableSeeder';
        $model = 'core\Models\CoreAnnounce';
        return array($url, $seeder, $model);
    }
}
