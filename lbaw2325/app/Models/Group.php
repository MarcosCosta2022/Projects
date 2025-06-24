<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Http\Controllers\FileController;

class Group extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'groups'; // Define the table name

    protected $fillable = [
        'name', 
        'description', 
        'picture'
    ];

    public function isMember($userId)
    {
        return $this->members->contains('id', $userId);
    }
    

    // Define relationships here, if any (e.g., members of the group)
    public function members()
    {
        return $this->belongsToMany(User::class, 'groupmember', 'id_group', 'id_user')
                    ->withPivot('isgroupadmin');
    }
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'group_id');
    }

    public function getPicture()
    {
        return FileController::get('group', $this->id);
    }

    public function isAdmin($userId){
        return $this->members()->where('id_user', $userId)->where('isgroupadmin', true)->exists();
    }
 
}

